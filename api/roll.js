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

  // Initialize results array and variables for advantage/disadvantage
  let results = [];
  let advantageResult = 0;
  let disadvantageResult = Infinity;

  // Determine the number of rolls: default to numberOfDice, but 2 for adv/disadv
  const rollsNeeded = modifier ? 2 : numberOfDice;

  for (let i = 0; i < rollsNeeded; i++) {
    const result = Math.floor(Math.random() * sides) + 1;
    results.push(result);
    advantageResult = Math.max(advantageResult, result);
    disadvantageResult = Math.min(disadvantageResult, result);
  }

  // Adjust response based on modifier
  let response = {};
  if (modifier === 'a') {
    response = {
      roll,
      result: advantageResult, // Only return the highest result for advantage
    };
  } else if (modifier === 'd') {
    response = {
      roll,
      result: disadvantageResult, // Only return the lowest result for disadvantage
    };
  } else {
    // For standard rolls, return the first result and ignore others
    response = {
      roll,
      result: results[0], // Only return the first result for a standard roll
    };
  }

  // Send the appropriate response
  res.status(200).send(response);
};
