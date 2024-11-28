/* {
  "src": "/.*",
  "dest": "/api/vercel.js"
}, */

export default function handler(req, res) {
    const { rul } = req.query;
    // res.status(200).json({ name: 'hello John' });
    res.status(200).send(`hello ${rul} !`);
}
