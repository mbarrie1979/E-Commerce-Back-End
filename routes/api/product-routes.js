const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products

router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      // Include associated Category and Tags
      include: [
        {
          model: Category,
          attributes: ['id', 'category_name'], // Specify the attributes you want from Category
        },
        {
          model: Tag,
          attributes: ['id', 'tag_name'], // Specify the attributes you want from Tag
        },
      ],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});



// get one product
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id; // Extract the id from request parameters
    const productData = await Product.findByPk(productId, {
      // Use findByPk to find a product by its primary key (id)
      include: [
        {
          model: Category,
          attributes: ['id', 'category_name'], // Include associated Category
        },
        {
          model: Tag,
          attributes: ['id', 'tag_name'], // Include associated Tags
          through: {
            attributes: [], // Optionally exclude fields from the join table (ProductTag)
          },
        },
      ],
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});




router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      "product_name": "Basketball",
      "price": 200.00,
      "stock": 3,
      "tagIds": [1, 2, 3, 4]
    }
  */

  try {
    // create new product
    const product = await Product.create(req.body);

    // if there are product tags, create pairings to bulk create in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
      // If the bulkCreate operation is successful, you might want to return the newly created product
      // along with its associated tags. Hence, you would refetch or construct the combined object.
      const resultProduct = await Product.findOne({
        where: { id: product.id },
        include: [
          {
            model: Tag,
            through: ProductTag,
            as: 'tags'
          }
        ],
      });
      res.status(200).json(resultProduct);
    } else {
      // if no product tags, just respond with the product
      res.status(200).json(product);
    }
  } catch (err) {
    // error logging
    console.error('Error while creating product:', err);
    res.status(400).json(err);
  }
});


// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id; // Extract the id from request parameters
    const deletedProduct = await Product.destroy({
      where: {
        id: productId, // Specify the product id to delete
      },
    });

    if (deletedProduct) {
      res.status(200).json({ message: 'Product deleted successfully.' });
    } else {
      // If no rows are deleted, it means no product was found with the provided id.
      res.status(404).json({ message: 'No product found with this id!' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


module.exports = router;
