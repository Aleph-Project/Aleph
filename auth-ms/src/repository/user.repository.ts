import { UserModel, IUser } from "../models/user.mongo.model";

export class UserRepository {
  async create(user: Partial<IUser>): Promise<IUser> {
    const newUser = new UserModel(user);
    return await newUser.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async updateActive(id: string, active: boolean): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, { active }, { new: true });
  }

  // Puedes agregar más métodos según lo necesites
}
