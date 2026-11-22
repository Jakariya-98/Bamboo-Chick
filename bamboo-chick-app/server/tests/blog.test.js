
import { test } from 'node:test';
import assert from 'node:assert/strict';
import Blog from '../src/models/Blog.js';

test('blog requires a title', () => {
  const blog = new Blog({
    body: 'This is a product blog.'
  });

  assert.ok(blog.validateSync()?.errors.title);
});

test('blog requires content', () => {
  const blog = new Blog({
    title: 'My Bamboo Chick Blog'
  });

  assert.ok(blog.validateSync()?.errors.body);
});
