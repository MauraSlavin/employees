async function connect()
{
    try
    {
        await new Promise((resolve, reject) => {
            my_connection.connect(err => {
                return err ? reject(err) : resolve()
            })
        })
    }
    catch(err)
    {
        ...handle errors...
    }
}

connect()

// This made my inquirer stop after displaying the questions.
// 