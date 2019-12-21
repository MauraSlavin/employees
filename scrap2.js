async function buildString() {
  try {
    const connection = await DatabasePool.getConnection();
    const string1 = await connection.query(query);
    const string2 = await connection.query(query);
    const string3 = await connection.query(query);
    const string4 = await connection.query(query);

    return string1 + string2 + string3 + string4;
  } catch (err) {
    // do something
  }
}