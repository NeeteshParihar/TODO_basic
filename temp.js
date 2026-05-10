
import axios from "axios";


const todos = [];

const res = {
    "hasNextPage": true,
    "nextCursor": null
}

while( res.hasNextPage ){

    try{
         const { data } = await axios.get("http://localhost:3000/api/todo/get", {
        params: {
            limit: 15,
            cursor: res.nextCursor
        },
        headers: {           
            // Note: If your backend expects it as a cookie instead, use:
            Cookie: `jwtToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWRjYmU0YjVlMzVmZDA2MTQwYTEyZDUiLCJpYXQiOjE3Nzg0MTgyMTMsImV4cCI6MTc3ODQxOTExM30.-HwACi9APU3yTSb3QgoY7krT81s6z2dVHgq2X6P9a7Y; Path=/; HttpOnly; Expires=Sun, 10 May 2026 13:18:33 GMT;`
        }
    })

    const newTodos = data.data.todos;
    const hasNextPage = data.data.hasNextPage;
    const nextCursor = data.data.nextCursor;
    
    todos.push(...newTodos)
    res.hasNextPage = hasNextPage
    res.nextCursor = nextCursor
    
    }
    catch(err){
        console.log(err);
    }
   
}


let pendingCount = 0;
for( const todo of todos ){
    if( !todo.isCompleted ){
        pendingCount++;
    }
}


console.log(`pending count : ${pendingCount}`);
console.log(`completed count : ${todos.length - pendingCount}`);