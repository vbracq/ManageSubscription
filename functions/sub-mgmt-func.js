/**
 * Copyright 2014, 2023 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

function main(params) {

    console.log("Call parameters ==> " + (params || "no parms"));
    var msg = 'No data found or error encoutered !'

    // Init SDK
    const UsageReportsV4 = require('@ibm-cloud/platform-services/usage-reports/v4');
    const serviceClient = UsageReportsV4.newInstance({});
    const jsonata = require('jsonata');
    const jsonataEcpression = jsonata('$sum(subscription.subscriptions.terms.credits.total) -$sum(subscription.subscriptions.terms.credits.used)');

    // Calculate billing period 
    var today = new Date();
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var blng = (process.env.USAGE_REPORTS_PERIOD || yyyy + "-" + mm);
    console.log("Billing period searched ==> " + blng);

    const billingParams = {
        accountId: (process.env.USAGE_REPORTS_ACCOUNTID || "error"),
        billingmonth: blng,
    };

    //Get report from billing service
    serviceClient.getAccountSummary(billingParams)
        .then(res => {
            console.log("In response process!!!");
            msg = JSON.stringify(res.result.subscription.subscriptions, null, 2);
            console.log(JSON.stringify(res.result.subscription.subscriptions, null, 2));
            var subNum = res.result.subscription.subscriptions.length;
            var subInfo = jsonataEcpression.evaluate(res.result.subscription);
            console.log('Remaining balance ==> %d', subInfo);
        })
        .catch(err => {
            console.log(err)
        });

    return {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        body: `<html><body><h3>${msg}</h3></body></html>`
    }
}

module.exports.main = main;