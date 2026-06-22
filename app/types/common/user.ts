export type UserData = {
  token: string;
  token_type: "Bearer";
  user: {
    id: number;
    name: string;
    email: string;
  };
};
