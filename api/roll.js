module.exports = (req, res) => {
  const { roll } = req.query;

  // Extend regex to capture advantage (a) or disadvantage (d)
  const match = roll.match(/^(\d+)d(\d+)([ad]?)$/);
  if (!match) {
    return res.status(400).send({ error: 'Invalid roll format. Use [number of dice]d[number of sides][a|d] (e.g., 2d6, 1d20a, 1d20d).' });
  }

  const [_, numberOfDice, sides, modifier] = match.map((value, index) => index === 0 ? value : Number(value) || value);

  if (isNaN(numberOfDice) || isNaN(sides) || numberOfDice < 1 || sides < 1) {
    return res.status(400).send({ error: 'Invalid number of dice or sides. Both must be positive numbers.' });
  }

  let results = [];
  let total = 0;
  let advantageResult = 0;
  let disadvantageResult = Infinity;
  
  for (let i = 0; i < Math.max(numberOfDice, 2); i++) { // Ensure at least two rolls for adv/disadv
    const result = Math.floor(Math.random() * sides) + 1;
    results.push(result);
    total += result;
    advantageResult = Math.max(advantageResult, result);
    disadvantageResult = Math.min(disadvantageResult, result);
  }

  // Adjust response based on modifier
  let response = {
    roll,
    results,
    total
  };

  if (modifier === 'a') {
    response = {
      roll,
      results,
      advantageResult, // Take the highest result for advantage
      total: advantageResult
    };
  } else if (modifier === 'd') {
    response = {
      roll,
      results,
      disadvantageResult, // Take the lowest result for disadvantage
      total: disadvantageResult
    };
  }

  // Return the modified response based on the presence of an advantage or disadvantage
  res.status(200).send(response);
};
