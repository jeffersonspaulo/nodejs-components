exports.id = 'kafkaconsumer';
exports.title = 'Kafka Consumer';
exports.group = 'Kafka';
exports.color = '#3f3e42';
exports.input = false;
exports.click = true;
exports.author = 'Jefferson Siqueira de Paulo';
exports.version = '1.0.0';
exports.output = 1;
exports.icon = 'exchange';

exports.html = `
<div class="padding">
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="server" class="m" data-jc-config="required:true;maxlength:500;placeholder:@(Localhost)">Server</div>
		</div>
		<div class="col-md-2 m">
			<div data-jc="textbox" data-jc-path="port" class="m" data-jc-config="required:true;maxlength:30;placeholder:@(29092);value:29092">Port</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="topic" class="m" data-jc-config="required:true;maxlength:30;placeholder:@(topic)">Topic</div>
		</div>
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="groupid" class="m" data-jc-config="required:true;maxlength:30;placeholder:@(groupid)">Group Id</div>
		</div>
		<div class="col-md-6">
			<div data-jc="textbox" data-jc-path="clientid" class="m" data-jc-config="required:true;maxlength:30;placeholder:@(clientid)">Client Id</div>
		</div>
	</div>
</div>
<script>
	ON('save.kafkaconsumer', function(component, options) {
		!component.name && (component.name = options.host);

		var builder = [];
		builder.push('### @(Configuration)');
		builder.push('');
		builder.push('- @(server): ' + options.server);
		builder.push('- @(port): ' + options.port);
		builder.push('- @(topic): ' + options.topic);
		builder.push('- @(groupid): ' + options.groupid);
		builder.push('- @(clientid): ' + options.clientid);
		component.notes = builder.join('\\n');
		console.log('NOTES', component.notes);
	});
</script>`;

exports.readme = `# Kafka Consumer

The component has to be configured. Connect to Kafka
Required install: npm install kafkajs


Returned Object: 

\`\`\`javascript

- TODO 

\`\`\`


`;

const { Kafka } = require("kafkajs");

exports.install = function (instance) {

	instance.custom.connect = async function () {

		try {
			const brokerAddress = instance.options.server + ':' + instance.options.port;

			const kafka = new Kafka({
				clientId: instance.options.clientid,
				brokers: [brokerAddress]
			  });

			const topic = instance.options.topic;

			const consumer = kafka.consumer({ groupId: instance.options.groupid });
			
			const run = async () => {
				await consumer.connect();
				await consumer.subscribe({ topic });
				await consumer.run({
					eachMessage: async ({ topic, partition, message, heartbeat }) => {
						instance.send2(0, message.value.toString());
					  },
				});
			};
			
			run().catch((error) => instance.send2(0, { "error": error.message, "component": `kafka Consumer - Tópico: ${topic}`}));

		   } catch (err) {
				let dateOb = new Date();

				instance.throw({ "error": err.message, "data": dateOb.toLocaleString(), "component": "kafka Consumer"});
				instance.send2(0, "Error: " + err.message);
		   }
	};

	instance.custom.reconfigure = function () {
		try{
			const can = instance.options.server && instance.options.port ? true : false;
			instance.status(can ? 'Listening' : 'Not configured', can ? 'green' : 'red');

			instance.custom.connect();
		}catch (err) {
			let dateOb = new Date();

			instance.throw({ "error": err.message, "data": dateOb.toLocaleString(), "component": "kafka Consumer reconfigure"});
			instance.send2(0, "Error: " + err.message);
	   }
	};

	instance.on('click', instance.custom.reconfigure);
	
	ON('controller', instance.custom.reconfigure);

	instance.on('options', instance.custom.reconfigure);
	instance.custom.reconfigure();

	instance.on('close', function(){
		const consumer = kafka.consumer({ groupId: instance.options.groupid });

		consumer.disconnect();

		uninstall('id:' + instance.id);
	});
};

FLOW.trigger(exports.id, function(next) {
	next(true);
});

exports.uninstall = function() {
	FLOW.trigger('kafkaconsumer', null);
};

