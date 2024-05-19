import orderModel from "../model/Order.js"


export async function fetchOrdersByUser(req, res) {
    const { id } = req.user;
    try {
      const orders = await orderModel.find({ user: id });
  
      res.status(200).json(orders);
    } catch (err) {
      res.status(400).json(err);
    }
  };
  
export async function createOrder(req, res) {

    try {
      const order = new orderModel(req.body);
      const doc = await order.save();             
      res.status(201).json(doc);
    } catch (err) {
      res.status(400).json(err);
    }
  };
  
export async function deleteOrder(req, res) {
        const { id } = req.params;
      try {
      const order = await orderModel.findByIdAndDelete(id);
      res.status(200).json(order);
    } catch (err) {
      res.status(400).json(err);
    }
  };
  
export async function updateOrder(req, res) {
    const { id } = req.params;
    try {
      const order = await orderModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json(order);
    } catch (err) {
      res.status(400).json(err);
    }
  };

export async function fetchAllOrders(req, res) {
    // sort = {_sort:"price",_order="desc"}
    // pagination = {_page:1,_limit=10}
    let query = orderModel.find({deleted:{$ne:true}});
    let totalOrdersQuery = orderModel.find({deleted:{$ne:true}});
  
    
    if (req.query._sort && req.query._order) {
      query = query.sort({ [req.query._sort]: req.query._order });
    }
  
    const totalDocs = await totalOrdersQuery.count().exec();
  
    if (req.query._page && req.query._limit) {
      const pageSize = req.query._limit;
      const page = req.query._page;
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }
  
    try {
      const docs = await query.exec();
      res.set('X-Total-Count', totalDocs);
      res.status(200).json(docs);
    } catch (err) {
      res.status(400).json(err);
    }
  };
  