from environment import Environment
import os

class CommandProcessor:
		
	def execute(self, context, command, args):
		if context is None or command is None:
			return
		print('Executing {}.{}'.format(context, command))
		if len(args) > 0:
			print('with arguments: {}'.format(args))
		match context.upper():
			case "UI":
				self.processUICommand(command, args)
			case "SI":
				self.processSICommand(command, args)
			case "SYS":
				self.processSYSCommand(command, args)
	
	def processUICommand(self, command, args):
		match command.upper():
			case "RELOAD":
				pass
			case "RESTART":
				pass
	
	def processSICommand(self, command, args):
		match command.upper():
			case "RESTART":
				Environment.updaterThread.shutdown()
	
	def processSYSCommand(self, command, args):
		match command.upper():
			case "SHUTDOWN":
				os.system('shutdown -h now')
			case "RESTART":
				os.system('shutdown -r now')
			case "MAINTENANCE":
				if len(args) > 0:
					match args[0].lower():
						case 'on':
							Environment.maintenanceMode = args[0]
						case 'off':
							Environment.maintenanceMode = args[0]
						case 'default':
							Environment.maintenanceMode = None
		
