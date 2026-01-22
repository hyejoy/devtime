/** API req, res 타입 정의 */

// response
export interface SignUpCheckResponse {
  success: boolean;
  available: boolean;
  message: string;
}
// request
export type DuplicateCheckApi = (value: string) => Promise<SignUpCheckResponse>;
