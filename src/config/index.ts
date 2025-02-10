// src/config/index.ts

interface Config {
  API_BASE_URL: string;
}

const development: Config = {
  API_BASE_URL: "https://api.donghyun.cc",
};

const production: Config = {
  API_BASE_URL: "https://api.donghyun.cc",
};

const config = process.env.NODE_ENV === "production" ? production : development;

export const { API_BASE_URL } = config;
