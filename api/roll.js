module.exports = (req, res) => {
    const { roll } = req.query;
    
    // Extends the regex to capture advantage (a) or disadvantage (d)
    const match = roll.match(/^(\d+)d(\d+)([ad]?)$/);
    if (!match) {
      return res.status(400).send({ error: 'Invalid roll format. Use [number of dice]d[number of sides][a|d] (e.g., 2d6a).' });
    }
  
    const [_, numberOfDice, sides, option] = match.map((value, index) => index === 0 ? value : Number(value) || value);
  
    if (isNaN(numberOfDice) || isNaN(sides) || numberOfDice < 1 || sides < 1) {
      return res.status(400).send({ error: 'Invalid number of dice or sides. Both must be positive numbers.' });
    }
  
    let results = [];
    let total = 0;
    let adjustedResult;
  
    for (let i = 0; i < numberOfDice; i++) {
      const roll1 = Math.floor(Math.random() * sides) + 1;
      const roll2 = Math.floor(Math.random() * sides) + 1;
  
      let result;
      if (option === 'a') {
        // Advantage: take the higher of two rolls
        result = Math.max(roll1, roll2);
      } else if (option === 'd') {
        // Disadvantage: take the lower of two rolls
        result = Math.min(roll1, roll2);
      } else {
        // No advantage/disadvantage: just use the first roll
        result = roll1;
      }
  
      results.push({ roll1, roll2, result });
      total += result;
    }
  
    if (numberOfDice === 1) {
      adjustedResult = results[0].result;
    }
  
    res.status(200).send({
      roll,
      results,
      total,
      ...(adjustedResult !== undefined && { adjustedResult })
    });
  };
  