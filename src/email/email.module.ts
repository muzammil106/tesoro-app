import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const port = Number(config.get('EMAIL_PORT')) || 587;
        const isSecure = port === 465;
        
        return {
          transport: {
            host: config.get('EMAIL_HOST'),
            port: port,
            secure: isSecure, // true for 465, false for other ports
            auth: {
              user: config.get('EMAIL_USER'),
              pass: config.get('EMAIL_PASS'),
            },
            tls: {
              // Do not fail on invalid certificates
              rejectUnauthorized: false,
              // Allow legacy TLS versions if needed
              minVersion: 'TLSv1.2',
            },
            // Connection timeout settings
            connectionTimeout: 60000, // 60 seconds
            greetingTimeout: 30000, // 30 seconds
            socketTimeout: 60000, // 60 seconds
            // Enable connection pooling
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
          },
          defaults: {
            from: config.get('EMAIL_FROM'),
          },
          template: {
            dir: join(process.cwd(), 'src/email/templates'),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}