export type RoutePath = `/${string}`;

export type HelperLink = {
  text: string;
  label: string;
  href?: RoutePath;
  onClick?: () => void;
};
export interface BasicStructure {
  success?: boolean;
  error?: {
    message: string;
    statusCode: number;
  };
}
