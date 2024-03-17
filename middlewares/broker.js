const amqp = require('amqplib');

exports.setupRabbitMQ = async () => {
    try {
      const connection = await amqp.connect('amqp://localhost');
      const channel = await connection.createChannel();
      const exchange = 'chatApp';
  
      await channel.assertExchange(exchange, 'direct', { durable: true });
  
      return { connection, channel, exchange };
    } catch (error) {
      console.error('Error setting up RabbitMQ:', error);
      throw error;
    }
}
