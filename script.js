

function getResPromise(){
    return new Promise( (res, req) => rej("The promise is resolved"));
}


const val = await getResPromise().catch(err => console.log("some error"));

console.log(val);

