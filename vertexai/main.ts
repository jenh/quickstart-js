/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { initializeApp } from 'firebase/app';
import { firebaseConfig, RECAPTCHA_ENTERPRISE_SITE_KEY } from './config';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check';
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai-preview';
import { getRemoteConfig } from 'firebase/remote-config';
import { getValue } from 'firebase/remote-config';
import { fetchAndActivate } from 'firebase/remote-config';

async function main() {
  const app = initializeApp(firebaseConfig);

  // Initialize App Check
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
  });

  // Initialize Remote Config and get a reference to the service
  const remoteConfig = getRemoteConfig(app);

  // Set a minimum fetch interval
  remoteConfig.settings.minimumFetchIntervalMillis = 0;

  // Set default Remote Config parameter values
  // For this example, these are set manually, but Firebase recommends
  // downloading defaults and accessing them from a file as
  // described at
  // https://firebase.google.com/docs/remote-config/get-started?platform=web#default-parameter-in-app

  remoteConfig.defaultConfig = {
    model_name: 'gemini-1.5-flash-preview-0514',
    prompt:
      'Tell me why Remote Config is essential when developing apps with Vertex AI for Firebase SDKs!',
  };

  // Fetch and activate Remote Config
  await fetchAndActivate(remoteConfig)
    .then(() => {
      console.log('Remote Config fetched.');
    })
    .catch((err) => {
      console.error('Remote Config fetch failed', err);
    });
  const modelName = getValue(remoteConfig, 'model_name');
  const prompt = getValue(remoteConfig, 'prompt');

  console.log('prompt is:', prompt.asString());
  // Get VertexAI instance
  const vertexAI = getVertexAI(app);
  // Get a Gemini model
  const model = getGenerativeModel(vertexAI, { model: modelName.asString() });
  // Call generateContent with a string or Content(s)
  const generateContentResult = await model.generateContent(prompt.asString());
  console.log(generateContentResult.response.text());
}

main();
