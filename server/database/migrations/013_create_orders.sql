CREATE TABLE IF NOT EXISTS orders (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  order_number        VARCHAR(30)   NOT NULL UNIQUE,
  status              VARCHAR(30)   NOT NULL DEFAULT 'pending'
                                    CHECK (status IN (
                                      'pending', 'confirmed', 'processing',
                                      'shipped', 'delivered', 'cancelled', 'refunded'
                                    )),

  -- Address snapshot at time of order
  shipping_name       VARCHAR(150)  NOT NULL,
  shipping_phone      VARCHAR(20)   NOT NULL,
  shipping_line1      TEXT          NOT NULL,
  shipping_line2      TEXT,
  shipping_city       VARCHAR(100)  NOT NULL,
  shipping_state      VARCHAR(100)  NOT NULL,
  shipping_pincode    VARCHAR(10)   NOT NULL,
  shipping_country    VARCHAR(80)   NOT NULL DEFAULT 'India',

  -- Financials (stored in INR, 2 decimal places)
  subtotal            NUMERIC(10,2) NOT NULL,
  shipping_charge     NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount        NUMERIC(10,2) NOT NULL,

  coupon_id           UUID          REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code         VARCHAR(50),
  notes               TEXT,

  -- Razorpay
  razorpay_order_id   VARCHAR(100),
  payment_status      VARCHAR(30)   NOT NULL DEFAULT 'pending'
                                    CHECK (payment_status IN (
                                      'pending', 'paid', 'failed', 'refunded'
                                    )),

  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id          ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status           ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status   ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number     ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order   ON orders(razorpay_order_id);
