//Tags attached to test.describe/test blocks so subsets can be run via `--grep @tagname`
export enum TAG {
  oauth = "@oauth",
  negative = "@negative",
  smoke = "@smoke",
  regression = "@regression",
  passwordGrant = "@passwordGrant",
  clientCredentialsGrant = "@clientCredentialsGrant",
  RefreshTokenGrant = "@refreshTokenGrant",
  courses = "@courses",
  chapter = "@chapter",
  admin = "@admin",
  uploadFile = "@uploadFile",
  permissions = "@permissions",
  invalidDataTypes = "@invalidDataTypes",
}
