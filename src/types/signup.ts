// src/types/signup.ts
export type SignField = 'id' | 'nickname' | 'password' | 'checkPassword';
export type DuplicateField = 'id' | 'nickname';

export type SignInput = Record<SignField, string>;
export type SignValid = Record<SignField, boolean>;
export type DuplicateState = Record<DuplicateField, boolean>;
