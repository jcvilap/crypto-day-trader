import Credential from './Credential'

class User {
    public login: string;
    public fullName: string;
    public email: string;
    public credentials: Array<Credential>;
}

export default User;