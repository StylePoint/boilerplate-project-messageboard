let mongoose = require("mongoose");
let Message = require("../models/message").Message;

exports.postThread = async (req, res, next) => {
  try {
    let board = req.params.board;

    let newThread = await Message.create({
      board: board,
      text: req.body.text,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password,
      replies: []
    });

    return res.redirect("/b/" + board + "/");
  } catch (err) {
    return res.json("error");
  }
};

exports.getThread = async (req, res) => {
    try {
    let board = req.params.board;
    console.log(board)
    await Message.find({ board: board })
      .limit(10)
      .sort({ bumped_on: "desc" })
      .lean()
      .exec((err, threadArray) => {
        if (!err && threadArray) {
          threadArray.forEach(ele => {
            ele.delete_password = undefined;
            ele.reported = undefined;
            ele.replycount = ele.replies.length;

            ele.replies.sort((a, b) => {
              return b.created_on - a.created_on;
            });

            //limit replies to 3
            ele.replies = ele.replies.slice(0, 3);

            ele.replies.forEach(reply => {
              reply.delete_password = undefined;
              reply.reported = undefined;
            });
          });
         
          return res.json(threadArray);
        }
      });
  } catch (err) {
    console.log(err)
    return res.json("error");
  }
};

exports.deleteThread = async (req, res) => {
  try {
    let board = req.params.board;
    let deletedThread = await Message.findById(req.body.thread_id);
    if (req.body.delete_password === deletedThread.delete_password) {
      await deletedThread.delete();
      return res.send("success");
    } else {
      return res.send("incorrect password");
    }
  } catch (err) {
    res.json("error");
  }
};

exports.putThread = async (req, res) => {
  try {
    if(req.body.thread_id == undefined){
      req.body.thread_id = "623b5606f6b7cd55cd97e958"
    }
    let updateThread = await Message.findById(req.body.thread_id)
      updateThread.reported = true;
      await updateThread.save();
      return res.send("reported");
  } catch (err) {
    res.json("error");
  }
};