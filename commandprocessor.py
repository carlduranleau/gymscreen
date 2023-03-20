from environment import Environment
from logger import Logger
from subprocess import check_output
import os

class CommandProcessor:
		
	def execute(self, sessiontoken, context, command, args):
		Environment.security.validateSession(sessiontoken)
		if context is None or command is None:
			return
		#Environment.logger.log('Executing {}.{}'.format(context, command))
		if len(args) > 0:
			Environment.logger.log('with arguments: {}'.format(args))
		result = None
		match context.upper():
			case "UI":
				result = self.processUICommand(command, args)
			case "SI":
				result = self.processSICommand(command, args)
			case "SYS":
				result = self.processSYSCommand(command, args)
			case "LOG":
				result = self.processLOGCommand(command, args)
			case "OS":
				result = self.processOSCommand(command, args)
		return result
	
	def processUICommand(self, command, args):
		match command.upper():
			case "RELOAD":
				pass
			case "RESTART":
				pass
		return "OK"

	def processOSCommand(self, command, args):
		if not command is None:
			parsedArgs = ''
			if not args is None:
				for arg in args:
					parsedArgs += ' ' + arg
				parsedArgs = parsedArgs.replace('%20', ' ')
			return check_output('{} {}'.format(command, parsedArgs), shell=True).decode('ascii').replace('"', '\\"')
		return "INVALID"

	def processLOGCommand(self, command, args):
		size = "25"
		if not command is None:
			size = command
		logFileName = Environment.logger.getLogFilename()
		return check_output('tail -{} {}'.format(size, logFileName), shell=True).decode('ascii').replace('"', '\\"')
		

	def processSICommand(self, command, args):
		match command.upper():
			case "RESTART":
				Environment.updatethread.shutdown()
		return "OK"
	
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
		return "OK"

