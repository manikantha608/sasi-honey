-- Add orders FK to coupon_usage now that the orders table exists
ALTER TABLE coupon_usage
  ADD CONSTRAINT fk_coupon_usage_order
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
