CREATE TABLE IF NOT EXISTS payments (
  id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID          NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  user_id                 UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  amount                  NUMERIC(10,2) NOT NULL,
  currency                VARCHAR(10)   NOT NULL DEFAULT 'INR',
  status                  VARCHAR(30)   NOT NULL DEFAULT 'pending'
                                        CHECK (status IN (
                                          'pending', 'captured', 'failed',
                                          'refunded', 'partially_refunded'
                                        )),

  -- Razorpay references
  razorpay_order_id       VARCHAR(100)  NOT NULL,
  razorpay_payment_id     VARCHAR(100)  UNIQUE,
  razorpay_signature      TEXT,

  -- Refund
  refund_id               VARCHAR(100),
  refunded_amount         NUMERIC(10,2),
  refunded_at             TIMESTAMPTZ,

  method                  VARCHAR(50),  -- e.g. 'card', 'upi', 'netbanking'
  failure_reason          TEXT,

  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id             ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id              ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id  ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status               ON payments(status);
