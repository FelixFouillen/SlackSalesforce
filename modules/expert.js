var nforce = require('nforce'),
    org = require('./auth').org,

    EXPERT_TOKEN = process.env.SLACK_EXPERT_TOKEN;

function execute(req, res) {

    if (req.body.token != EXPERT_TOKEN) {
        res.send("Invalid token");
        return;
    }

    var params = req.body.text;
    var slackUserId = req.body.user_id;
    if(params = null || params = 'List') {
        var q = "SELECT Id, Name, Slack_ID__c, Achievement__c FROM Expert_Achievement__c WHERE Slack_ID__c = " + slackUserId;
        org.query({query: q}, function(err, resp) {
            if (err) {
                console.error(err);
                res.send("An error as occurred");
                return;
            }
            if (resp.records && resp.records.length>0) {
                var expertAchievement = resp.records;
                var attachments = [];
                opportunities.forEach(function(opportunity) {
                    var fields = [];
                    fields.push({title: "Slack User ID", value: expertAchievement.get("Slack_ID__c"), short:true});
                    fields.push({title: "Achievement", value: expertAchievement.get("Achievement__c"), short:true});
                    fields.push({title: "Link", value: "https://login.salesforce.com/" + expertAchievement.getId(), short:true});
                    attachments.push({color: "#FCB95B", fields: fields});
                });
                res.json({
                    response_type: "in_channel",
                    text: "Your Achievement",
                    attachments: attachments
                });
            } else {
                res.send("No records");
            }
        });
    } else {
        var c = nforce.createSObject('Expert_Achievement__c');
        c.set('Slack_ID__c', slackUserId);
        c.set('Achievement__c', achievement);
        var achievement = params;

        org.insert({ sobject: c}, function(err, resp) {
            if (err) {
                console.error(err);
                res.send("An error occurred while creating an expert achievement");
            } else {
                var fields = [];
                fields.push({title: "Slack ID", value: Slack_ID__c, short:false});
                fields.push({title: "Achievement", value: Achievement__c, short:false});
                fields.push({title: "Link", value: 'https://login.salesforce.com/' + resp.id, short:false});
                var message = {
                    response_type: "in_channel",
                    text: "A new achievement has been created:",
                    attachments: [
                        {color: "#F2CF5B", fields: fields}
                    ]
                };
                res.json(message);
            }
        });
    }
}

exports.execute = execute;