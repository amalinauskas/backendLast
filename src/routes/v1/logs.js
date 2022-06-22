const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');

const isLoggedIn = require('../../middleware/auth');
const validation = require('../../middleware/validation');
const { mysqlConfig } = require('../../config');

const router = express.Router();

const postSchema = Joi.object({
  title: Joi.required(),
  post: Joi.required(),
});

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`SELECT * FROM post WHERE user_id = ${req.user.accountId}`);
    await con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'Server issue occurred. Please try again later.' });
  }
});

router.post('/', isLoggedIn, validation(postSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
        INSERT INTO post (title, post, user_id)
        VALUES (${mysql.escape(req.body.title)}, ${mysql.escape(req.body.post)},
        ${mysql.escape(req.user.accountId)})`);
    await con.end();

    if (!data.insertId) {
      return res.status(500).send({ err: 'Please try again' });
    }
    return res.send({ msg: 'Successfully added a post' });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'Server issue occurred. Please try again later.' });
  }
});

router.post('/remove', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);

    const [data] = await con.execute(`DELETE FROM post
  
  WHERE id = ${mysql.escape(req.body.id)}`);

    await con.end();

    if (!data.affectedRows) {
      return res.status(500).send({ err: 'Please try again later' });
    }

    return res.send({ msg: 'Successfully deleted an Exercise' });
  } catch (err) {
    return res.status(500).send({ err: 'A server issue has occured - please try again later' });
  }
});

module.exports = router;
