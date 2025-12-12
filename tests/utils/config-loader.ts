import * as fs from 'fs';
import * as yaml from 'yaml';

export interface TestConfig {
  baseUrl: string;
  apiUrl: string;
  users: {
    userA: UserCredentials;
    userB: UserCredentials;
  };
  followRelationships: FollowRelationship[];
  testData: {
    article: ArticleData;
    comment: CommentData;
  };
  timeouts: {
    default: number;
    navigation: number;
  };
}

export interface UserCredentials {
  username: string;
  email: string;
  password: string;
  incorrectPassword: string;
}

export interface FollowRelationship {
  follower: string;
  following: string;
}

export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tags: string[];
}

export interface CommentData {
  body: string;
}

export function loadConfig(): TestConfig {
  const configFile = fs.readFileSync('./config.yml', 'utf8');
  return yaml.parse(configFile);
}

