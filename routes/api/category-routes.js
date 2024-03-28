const router = require('express').Router();
const { Category, Product } = require('../../models');



router.get('/', async (req, res) => {
  try {
     // find all categories
    const categoryData = await Category.findAll({
      include: [
        {
          model: Product,
          attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
        }

      ]
    });
    console.log(categoryData)
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});
// be sure to include its associated Products


router.get('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id; // Extract the id from request parameters
    const categoryData = await Category.findByPk(categoryId, {
      // Include associated Category and Products
      include: [
        {
          model: Product,
          attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
        },

      ],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    // create new category
    const categoryData = await Category.create(req.body);
    
    // Respond with the id and category name of the newly created category
    res.status(200).json({
      id: categoryData.id,
      category_name: categoryData.category_name,
    });
    
  } catch (err) {
    // error logging
    console.error('Error while creating category:', err);
    res.status(400).json({ message: 'Error while creating category' });
  }
});



router.put('/:id', async (req, res) => {
  try {
    // Destructure `id` parameter and potential update fields from `req.body`
    const { id } = req.params;
    const updateData = req.body;

    // Check if there is something to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No data provided for update.' });
    }

    // update category by its `id` value
    const [numberOfAffectedRows] = await Category.update(updateData, {
      where: { id },
    });

    // If no rows are affected, the category with the given id was not found
    if (numberOfAffectedRows === 0) {
      return res.status(404).json({ message: 'No category found with this id.' });
    }

    // Return the id and the updated fields
    const updatedCategory = await Category.findByPk(id);
    res.status(200).json(updatedCategory);

  } catch (err) {
    // Log the error and return a 500 error to the client
    console.error('Error while updating category:', err);
    res.status(500).json({ message: 'Error while updating category' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id; // Get the id from the request parameters
    const deleted = await Category.destroy({
      where: { id: categoryId }, // Use the id to find the category to delete
    });

    if (deleted) {
      res.status(200).json({ message: `Category with id ${categoryId} deleted.` });
    } else {
      res.status(404).json({ message: `Category with id ${categoryId} not found.` });
    }
  } catch (err) {
    console.error('Error while deleting category:', err);
    res.status(500).json({ message: 'Error while deleting category' });
  }
});


module.exports = router;
