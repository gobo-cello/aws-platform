#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import { AwsPlatformStack } from "../lib/aws-platform-stack";

const app = new cdk.App();

new AwsPlatformStack(app, "AwsPlatformStack");
