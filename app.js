require('dotenv').config();
const prompt = require('prompts');
const AWS = require('aws-sdk');

AWS.config.update(new AWS.Config({
	credentials: new AWS.Credentials({
		accessKeyId: process.env.ACCESS_KEY,
		secretAccessKey: process.env.SECRET_KEY
	}),
	region: process.env.REGION
}));

const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

console.log(`EC2 Instance Manager by Matthew Scott`);
async function main(){
	console.log(`Listing all instances.`);
	let instances = await new Promise((resolve, reject) => {
		ec2.describeInstances({}, (error, data) => {
			if (error) reject(error);
			
			for(const [index, instance] of data.Reservations[0].Instances.entries()){
				console.log(`[${index}] ${instance.Tags.find(x => x.Key == 'Name').Value} (${instance.InstanceId}) - ${instance.State.Name}`);
			}
			
			resolve(data.Reservations[0].Instances);
		});
	})
	.catch(error => {
		console.log(`ERROR: An error occurred when retrieving instances.`);
		console.log(`ERROR: ${error}`);
		process.exit(0);
	});
	
	const selection = await prompt({
		name: 'selected',
		message: 'Instance to toggle:',
		type: 'number',
		validate: input => parseInt(input) >= 0 && parseInt(input) <= instances.length - 1 ? true : 'Invalid instance number.'
	});
	
	var selected = instances[+selection.selected];
	
	console.log(`Selected ${selected.Tags.find(x => x.Key == 'Name').Value} (${selected.InstanceId}).`);
	
	if (selected.State.Code == 80){
		await new Promise((resolve, reject) => {
			ec2.startInstances({ InstanceIds: [ selected.InstanceId ] }, (error, data) => {
				if (error) reject(error);
				console.log(`Instance entering state ${data.StartingInstances[0].CurrentState.Name}.`);
				resolve();
			});
		})
		.catch(error => {
			console.log(`ERROR: An error occurred when starting the instance.`);
			console.log(`ERROR: ${error}`);
			process.exit(0);
		});
	}else{
		await new Promise((resolve, reject) => {
			ec2.stopInstances({ InstanceIds: [ selected.InstanceId ] }, (error, data) => {
				if (error) reject(error);
				console.log(`Instance entering state ${data.StoppingInstances[0].CurrentState.Name}.`);
				resolve();
			});
		})
		.catch(error => {
			console.log(`ERROR: An error occurred when starting the instance.`);
			console.log(`ERROR: ${error}`);
			process.exit(0);
		});
	}
	
	await new Promise((resolve, reject) => {
		console.log(`Please wait...`);
		setInterval(() => {
			ec2.describeInstanceStatus({ InstanceIds: [ selected.InstanceId ], IncludeAllInstances: true }, (error, data) => {
				if (error) reject(error);
				
				if ((selected.State.Code == 80 && (data.InstanceStatuses?.[0]?.InstanceState.Code ?? -1) == 16) || 
					(selected.State.Code == 16 && (data.InstanceStatuses?.[0]?.InstanceState.Code ?? -1) == 80)) resolve(data.InstanceStatuses[0].InstanceState.Name);
			});
		}, 1000);
	})
	.then(data => {
		console.log(`Instance state successfully changed to ${data}.`);
	})
	.catch(error => {
		console.log(`ERROR: An error occurred when checking instance state.`);
		console.log(`ERROR: ${error}`);
		process.exit(0);
	});
	
	main();
}

main();