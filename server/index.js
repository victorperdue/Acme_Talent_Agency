const {
  client,
  createTables,
  createUser,
  createSkill,
  fetchUsers,
  fetchSkills,
  createUserSkill,
  fetchUserSkills,
  deleteUserSkill
} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/skills', async(req, res, next)=> {
  try {
    res.send(await fetchSkills());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await fetchUsers());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users/:id/userSkills', async(req, res, next)=> {
  try {
    res.send(await fetchUserSkills(req.params.id));
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/users/:userId/userSkills/:id', async(req, res, next)=> {
  try {
    await deleteUserSkill({ user_id: req.params.userId, id: req.params.id });
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/users/:id/userSkills', async(req, res, next)=> {
  try {
    res.status(201).send(await createUserSkill({user_id: req.params.id, skill_id: req.body.skill_id}));
  }
  catch(ex){
    next(ex);
  }
});

const init = async()=> {
  console.log('connecting to database');
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
  const [moe, lucy, larry, ethyl, dancing, singing, plateSpinning, juggling] = await Promise.all([
    createUser({ username: 'moe', password: 'moe_pw'}),
    createUser({ username: 'lucy', password: 'lucy_pw'}),
    createUser({ username: 'larry', password: 'larry_pw'}),
    createUser({ username: 'ethyl', password: 'ethyl_pw'}),
    createSkill({ name: 'dancing'}),
    createSkill({ name: 'singing'}),
    createSkill({ name: 'plate spinning'}),
    createSkill({ name: 'juggling'})
  ]);

  console.log(await fetchUsers());
  console.log(await fetchSkills());

  const userSkills = await Promise.all([
    createUserSkill({ user_id: moe.id, skill_id: plateSpinning.id}),
    createUserSkill({ user_id: moe.id, skill_id: dancing.id}),
    createUserSkill({ user_id: ethyl.id, skill_id: singing.id}),
    createUserSkill({ user_id: ethyl.id, skill_id: juggling.id})
  ]);
  console.log(await fetchUserSkills(moe.id));
  await deleteUserSkill({ user_id: moe.id, id: userSkills[0].id});
  console.log(await fetchUserSkills(moe.id));

  console.log(`curl localhost:3000/api/users/${ethyl.id}/userSkills`);

  console.log(`curl -X POST localhost:3000/api/users/${ethyl.id}/userSkills -d '{"skill_id": "${dancing.id}"}' -H 'Content-Type:application/json'`);
  console.log(`curl -X DELETE localhost:3000/api/users/${ethyl.id}/userSkills/${userSkills[3].id}`);
  
  console.log('data seeded');

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));

}
init();

