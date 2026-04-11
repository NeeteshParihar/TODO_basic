import z, { email, ZodError } from "zod";

const Email = z.string().trim().email().toLowerCase();
const Username = z.string().trim().min(3);
const Password = z.string().min(8);

const userschema = z.object({
    username: Username,
    email: Email,
    password: Password,
    address: z.object({
        pincode: z.string().length(5),
        city: z.string().trim().min(1)
    }),
    blogs: z.array(z.object({
        id: z.string(),
        author: z.string()
    })),
    age: z.coerce.number(),    
});


const user1 = {
    username: "neetesh",
    email: "neeteshpariharmail.com           ",
    password: "234",
    address: {
        pincode: "12345",
        city: "knfkngkbnkhn"
    },
    blogs: [
        {
            id: "kfjgnkgj",
            author: "dkfjgnkjgnbkjg"
        }
    ],
    age: "443",
    somehtingExtra: "kdfjnbkgjbnkjnkgh"
   
}

try {

    const user = userschema.parse(user1);
    console.log(user);
    console.log(user1);

} catch (err) {
    
    const message = err.issues.map( ( issue)=> `${issue.path.join(".")}: ${issue.message}` );
    console.log(message);
}

