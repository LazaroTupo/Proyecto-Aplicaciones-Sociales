import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ManticoreService implements OnModuleInit {
  private readonly logger = new Logger(ManticoreService.name);
  private readonly manticoreUrl = 'http://213.210.20.7:9308';

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    try {
      this.logger.log('Initializing Manticore Search table...');
      const query = "CREATE TABLE IF NOT EXISTS proyectos(title text, description text, category string, project_id string)";
      await firstValueFrom(
        this.httpService.post(`${this.manticoreUrl}/cli`, {
          query,
        }).pipe(
          catchError((err) => {
            this.logger.error('Failed to initialize Manticore table:', err.message);
            throw err;
          }),
        ),
      );
      this.logger.log('Manticore table "proyectos" ready.');
    } catch (error) {
      this.logger.warn('Could not connect to Manticore Search. Make sure the container is running.');
    }
  }

  async indexProject(project: any) {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.manticoreUrl}/insert`, {
          index: 'proyectos',
          doc: {
            title: project.title,
            description: project.description,
            category: project.category,
            project_id: project.id,
          },
        }),
      );
    } catch (err: any) {
      this.logger.error(`Failed to index project ${project.id}:`, err.message);
    }
  }

  async updateProject(project: any) {
    try {
      const query = `UPDATE proyectos SET title = '${project.title.replace(/'/g, "''")}', description = '${project.description.replace(/'/g, "''")}', category = '${project.category?.replace(/'/g, "''") || ''}' WHERE project_id = '${project.id}'`;
      await firstValueFrom(
        this.httpService.post(`${this.manticoreUrl}/cli`, {
          query,
        }),
      );
    } catch (err: any) {
      this.logger.error(`Failed to update project ${project.id} in Manticore:`, err.message);
    }
  }

  async search(queryText: string): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.manticoreUrl}/search`, {
          index: 'proyectos',
          query: {
            match: {
              '*': `${queryText}*`,
            },
          },
          _source: ['project_id'],
          limit: 500,
        }),
      );
      
      const hits = response.data?.hits?.hits || [];
      return hits.map((hit: any) => hit._source.project_id);
    } catch (err: any) {
      this.logger.error(`Manticore search failed for query "${queryText}":`, err.message);
      return [];
    }
  }
}
