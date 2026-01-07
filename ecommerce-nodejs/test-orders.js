// Test script để kiểm tra orders API
const { defineModels } = require('./src/models');

async function testOrders() {
  try {
    const { Order, OrderDetail, Product, User } = defineModels();
    
    console.log('=== Testing Orders Query ===\n');
    
    // Test 1: Kiểm tra user_id = 2 có tồn tại không
    console.log('1. Checking if user_id = 2 exists...');
    const user = await User.findByPk(2);
    if (!user) {
      console.log('❌ User ID 2 does not exist!');
      return;
    }
    console.log('✅ User found:', user.toJSON());
    
    // Test 2: Query orders trực tiếp
    console.log('\n2. Querying orders for user_id = 2...');
    const orders = await Order.findAll({
      where: { user_id: 2 },
      include: [{
        model: OrderDetail,
        required: false,
        include: [{
          model: Product,
          required: false
        }]
      }],
      order: [['order_id', 'DESC']]
    });
    
    console.log(`✅ Found ${orders.length} orders`);
    
    // Test 3: Serialize từng order
    console.log('\n3. Serializing orders...');
    orders.forEach((order, idx) => {
      try {
        const orderJson = order.toJSON();
        console.log(`\nOrder ${idx + 1}:`, {
          order_id: orderJson.order_id,
          user_id: orderJson.user_id,
          total_price: orderJson.total_price,
          status: orderJson.status,
          orderDetails_count: orderJson.OrderDetails ? orderJson.OrderDetails.length : 0
        });
        
        if (orderJson.OrderDetails) {
          orderJson.OrderDetails.forEach((detail, dIdx) => {
            console.log(`  Detail ${dIdx + 1}:`, {
              order_detail_id: detail.order_detail_id,
              product_id: detail.product_id,
              quantity: detail.quantity,
              price: detail.price,
              has_product: !!detail.Product
            });
          });
        }
      } catch (err) {
        console.error(`❌ Error serializing order ${idx + 1}:`, err.message);
      }
    });
    
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

testOrders();

