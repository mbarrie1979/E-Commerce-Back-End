const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const tagsData = await Tag.findAll({
      // Include associated Product data
      include: [{
        model: Product,
        as: 'products', // Make sure 'as' matches the alias used in your association setup
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
        through: {
          attributes: [], // Exclude all attributes from the join table
        },
      }],
    });
    res.status(200).json(tagsData);
  } catch (err) {
    // Error handling
    console.error('Error fetching tags:', err);
    res.status(500).json({ message: 'Error fetching tags' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    // find a single tag by its `id`
    const tagData = await Tag.findByPk(req.params.id, {
      // include associated Product data
      include: [{
        model: Product,
        as: 'products', // Make sure 'as' matches the alias used in the association
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
        through: {
          attributes: [], // Exclude all attributes from the join table
        },
      }],
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id' });
    } else {
      res.status(200).json(tagData);
    }
  } catch (err) {
    console.error('Error fetching tag:', err);
    res.status(500).json({ message: 'Error fetching tag' });
  }
});


router.post('/', async (req, res) => {
  try {
    // Create a new tag with data available in req.body
    const newTag = await Tag.create(req.body);
    res.status(201).json(newTag);
  } catch (err) {
    console.error('Error creating new tag:', err);
    res.status(400).json({ message: 'Error creating new tag' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    // Update a tag's name by its `id` value
    const [updatedRows] = await Tag.update(req.body, {
      where: { id: req.params.id },
    });

    if (updatedRows > 0) {
      res.status(200).json({ message: `Tag updated successfully.` });
    } else {
      res.status(404).json({ message: `Tag with ID ${req.params.id} not found.` });
    }
  } catch (err) {
    console.error('Error updating tag:', err);
    res.status(500).json({ message: 'Error updating tag' });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    // Delete one tag by its `id` value
    const deleted = await Tag.destroy({
      where: { id: req.params.id },
    });

    if (deleted) {
      res.status(200).json({ message: `Tag deleted successfully.` });
    } else {
      res.status(404).json({ message: `Tag with ID ${req.params.id} not found.` });
    }
  } catch (err) {
    console.error('Error deleting tag:', err);
    res.status(500).json({ message: 'Error deleting tag' });
  }
});


module.exports = router;
