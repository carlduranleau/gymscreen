class CommandProcessor:
		
	def execute(self, context, command, args):
		if context is None or command is None:
			return
		print('Executing {}.{}'.format(context, command))
		if len(args) > 0:
			print('with arguments: {}'.format(args))
		match context.upper():
			case "UI":
				pass
			case "SI":
				pass
			case "SYS":
				pass
	
	def processUICommand(self, command, args):
		match command.upper():
			case "RELOAD":
				pass
			case "RESTART":
				pass
	
	def processSICommand(self, command, args):
		match command.upper():
			case "RESTART":
				pass
	
	def processSYSCommand(self, command, args):
		match command.upper():
			case "SHUTDOWN":
				pass
			case "RESTART":
				pass
			case "MAINTENANCE":
				pass
	