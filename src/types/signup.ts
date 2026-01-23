// src/types/signup.ts
export type SignField = 'id' | 'nickName' | 'password' | 'checkPassword';
export type DuplicateField = 'id' | 'nickName';

export type SignInput = Record<SignField, string>;
export type SignValid = Record<SignField, boolean>;
export type DuplicateState = Record<DuplicateField, boolean>;
