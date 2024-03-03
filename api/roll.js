module.exports = (req, res) => {
  // Extract the roll parameter from the query string (e.g., "2d6", "1d20a", "1d20d")
  const { roll } = req.query;

  // Use regular expression to parse the roll parameter
  // This captures the number of dice, sides of the dice, and whether it's advantage or disadvantage
  const match = roll.match(/^(\d+)d(\d+)([ad]?)$/);
  if (!match) {
    // If the roll parameter does not match the expected format, return an error
    return res.status(400).send({ error: 'Invalid roll format. Use [number of dice]d[number of sides][a|d] (e.g., 2d6, 1d20a, 1d20d).' });
  }

  // Destructure the regex match result to get the number of dice, sides, and the modifier (advantage/disadvantage)
  const [_, numberOfDice, sides, modifier] = match.map((value, index) => index === 0 ? value : Number(value) || value);

  // Validate the numbers to ensure they are positive
  if (isNaN(numberOfDice) || isNaN(sides) || numberOfDice < 1 || sides < 1) {
    return res.status(400).send({ error: 'Invalid number of dice or sides. Both must be positive numbers.' });
  }

  // Initialize variables to store the results and the final result for advantage/disadvantage
  let results = [];
  let advantageResult = 0;
  let disadvantageResult = Infinity;

  // Determine the number of times to roll the dice
  // For advantage/disadvantage, roll twice regardless of the number of dice specified
  const rollsNeeded = modifier ? 2 : numberOfDice;

  for (let i = 0; i < rollsNeeded; i++) {
    // Roll the dice and store the result
    const result = Math.floor(Math.random() * sides) + 1;
    results.push(result);
    // Update the advantage/disadvantage results
    advantageResult = Math.max(advantageResult, result);
    disadvantageResult = Math.min(disadvantageResult, result);
  }

  // Prepare the response based on the roll type
  let response;
  if (modifier === 'a') {
    // For advantage rolls, include both results and the highest one
    response = {
      roll,
      results, // Include both dice results for transparency
      result: advantageResult, // The highest result
    };
  } else if (modifier === 'd') {
    // For disadvantage rolls, include both results and the lowest one
    response = {
      roll,
      results, // Include both dice results for transparency
      result: disadvantageResult, // The lowest result
    };
  } else {
    // For standard rolls, return the results based on the number of dice
    response = {
      roll,
      result: results.slice(0, numberOfDice), // Return the requested number of dice results
    };
    // Simplify the response if only one die was rolled
    if (numberOfDice === 1) {
      response.result = response.result[0];
    }
  }

  // Send the response back to the client
  res.status(200).send(response);
};
