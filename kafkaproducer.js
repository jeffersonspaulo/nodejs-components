exports.id = 'kafkaproducer';
exports.title = 'Kafka Producer';
exports.group = 'Kafka';
exports.color = '#3f3e42';
exports.input = true;
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
			<div data-jc="textbox" data-jc-path="clientid" class="m" data-jc-config="required:true;maxlength:30;placeholder:@(clientid)">Client Id</div>
		</div>
	</div>
	<div class="row">
		<div class="col-md-12">
			<div data-jc="codemirror" data-jc-path="message" data-jc-config="type:sql;required:true;height:500;tabs:true;trim:true" class="m">@(Message)</div>
		</div>
	</div>
</div>`;

exports.readme = `# Kafka Producer

The component has to be configured. Connect to Kafka
Required install: npm install kafkajs


## Insert
- will producer message to kafka
- expects data to be an Object or an Array of Objects

Returned Object: 

\`\`\`javascript

- TODO 

\`\`\`


`;

const { Kafka } = require("kafkajs");

exports.install = function (instance) {

	var can = false;	

	instance.on('data', function (flowdata) {
		can && instance.custom.connect(flowdata);
	});

	instance.custom.connect = async function (flowdata) {

		try {
			const brokerAddress = instance.options.server + ':' + instance.options.port;

			const kafka = new Kafka({
				clientId: instance.options.clientid,
				brokers: [brokerAddress]
			  });

			  var message = instance.options.message != "" ? instance.options.message : flowdata.data.toString();
			  
			  if (message != ""){
				const producer = kafka.producer();

				var sendMessage = async () => {
					await producer.connect();
					await producer.send({
					  topic: instance.options.topic,
					  messages: [
						{ key: 'key1', value: message }
					  ],
					});

					await producer.disconnect();
				  }
				  
				  sendMessage();

				instance.send2(0, "Message: " + message);
			  }
			  
			//instance.send2(0, "SUCESSO");
		   } catch (err) {
				let dateOb = new Date();

				instance.throw({ "error": err.message, "data": dateOb.toLocaleString(), "component": "kafka"});
				instance.send2(0, "Error: " + err.message);
		   }

	};

	instance.reconfigure = function () {
		can = instance.options.server && instance.options.port ? true : false;
		instance.status(can ? '' : 'Not configured', can ? undefined : 'red');
	};

	instance.on('options', instance.reconfigure);
	instance.reconfigure();
};