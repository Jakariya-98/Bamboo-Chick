
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Review from '../src/models/Review.js';
import Product from '../src/models/Product.js';
import { addReview } from '../src/controllers/reviewController.js';

const productId = '507f1f77bcf86cd799439011';

test('review rejects ratings below 1 or above 5', () => {
  const tooLow = new Review({
    product: productId,
    name: 'Test Buyer',
    stars: 0,
    text: 'Good product'
  });

  const tooHigh = new Review({
    product: productId,
    name: 'Test Buyer',
    stars: 6,
    text: 'Good product'
  });

  assert.ok(tooLow.validateSync()?.errors.stars);
  assert.ok(tooHigh.validateSync()?.errors.stars);
});

test('review requires review text', () => {
  const review = new Review({
    product: productId,
    name: 'Test Buyer',
    stars: 5
  });

  assert.ok(review.validateSync()?.errors.text);
});

test('review requires a customer name', () => {
  const review = new Review({
    product: productId,
    stars: 5,
    text: 'Great product'
  });

  assert.ok(review.validateSync()?.errors.name);
});

test('review text cannot exceed 1000 characters', () => {
  const review = new Review({
    product: productId,
    name: 'Test Buyer',
    stars: 5,
    text: 'A'.repeat(1001)
  });

  assert.ok(review.validateSync()?.errors.text);
});

test('review name and text are trimmed', () => {
  const review = new Review({
    product: productId,
    name: '  Test Buyer  ',
    stars: 5,
    text: '  Great product  '
  });

  assert.equal(review.name, 'Test Buyer');
  assert.equal(review.text, 'Great product');
});

test('new reviews are visible by default', () => {
  const review = new Review({
    product: productId,
    name: 'Test Buyer',
    stars: 5,
    text: 'Great product'
  });

  assert.equal(review.hidden, false);
});

// Helper to temporarily replace a database method during testing
function replaceMethod(object, method, replacement) {
  const original = object[method];
  const hadOwnProperty = Object.prototype.hasOwnProperty.call(object, method);

  object[method] = replacement;

  return () => {
    if (hadOwnProperty) {
      object[method] = original;
    } else {
      delete object[method];
    }
  };
}

// Test 1: Buyer successfully adds a review
test('buyer can successfully add a review', async () => {
  const createdReview = {
    product: productId,
    name: 'Test Buyer',
    stars: 5,
    text: 'Excellent product'
  };

  const restoreExists = replaceMethod(
    Product,
    'exists',
    async () => true
  );

  const restoreFindOne = replaceMethod(
    Review,
    'findOne',
    async () => null
  );

  const restoreCreate = replaceMethod(
    Review,
    'create',
    async () => createdReview
  );

  try {
    const req = {
      params: { productId },
      user: { _id: 'buyer123', name: 'Test Buyer' },
      body: { stars: 5, text: 'Excellent product' }
    };

    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      }
    };

    let error;
    await addReview(req, res, (err) => {
      error = err;
    });

    assert.equal(error, undefined);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body, createdReview);
  } finally {
    restoreCreate();
    restoreFindOne();
    restoreExists();
  }
});

// Test 2: Review is rejected if the product does not exist
test('review is rejected when product does not exist', async () => {
  const restoreExists = replaceMethod(
    Product,
    'exists',
    async () => null
  );

  try {
    const req = {
      params: { productId },
      user: { _id: 'buyer123', name: 'Test Buyer' },
      body: { stars: 5, text: 'Excellent product' }
    };

    const res = {
      status() {
        return this;
      },
      json() {
        return this;
      }
    };

    let error;
    await addReview(req, res, (err) => {
      error = err;
    });

    assert.equal(error.status, 404);
    assert.equal(error.message, 'Product not found');
  } finally {
    restoreExists();
  }
});

// Test 3: Buyer cannot review the same product twice
test('buyer cannot submit a duplicate review', async () => {
  const restoreExists = replaceMethod(
    Product,
    'exists',
    async () => true
  );

  const restoreFindOne = replaceMethod(
    Review,
    'findOne',
    async () => ({ _id: 'existingReview123' })
  );

  try {
    const req = {
      params: { productId },
      user: { _id: 'buyer123', name: 'Test Buyer' },
      body: { stars: 5, text: 'Excellent product' }
    };

    const res = {
      status() {
        return this;
      },
      json() {
        return this;
      }
    };

    let error;
    await addReview(req, res, (err) => {
      error = err;
    });

    assert.equal(error.status, 409);
    assert.equal(
      error.message,
      'You have already reviewed this product'
    );
  } finally {
    restoreFindOne();
    restoreExists();
  }
});
