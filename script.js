
const getPromise = () => {
    return new Promise((res, rej) => res("Promise resolved"));
}


if (true) {

    if (true) {
        const val = await getPromise();
        console.log(val);
    }
}


