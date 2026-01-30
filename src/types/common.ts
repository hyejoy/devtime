export type HelperLink = {
  text: string;
  label: string;
  href: `/${string}`;
};
export interface BasicStructure {
  success?: boolean;
  error?: {
    message: string;
    statusCode: number;
  };
}
