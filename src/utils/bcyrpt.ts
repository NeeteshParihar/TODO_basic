
import bcrypt from 'bcrypt';

const saltRounds = 10;

export const hashPassword = async( password: string): Promise<string> =>{
    const hashedValue: string = await bcrypt.hash(password, saltRounds);
    return hashedValue;
}


export const comparePassword = async( password: string, hashPassword: string): Promise<boolean> =>{ 
    const matched = await bcrypt.compare(password, hashPassword);
    return matched;
}


