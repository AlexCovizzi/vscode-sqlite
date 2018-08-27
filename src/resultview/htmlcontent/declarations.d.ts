// Prevent typescript from complaining about css requires
declare module "*.css" {
  const content: any;
  export default content;
}
