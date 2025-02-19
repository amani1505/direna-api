import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { getMetadataArgsStorage, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@modules/user/entities/user.entity';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { PaginationInterface } from '@interface/pagination.interface';
import { applyFiltersAndPagination } from '@utils/filter';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly _blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    try {
      const { userId, ...blogData } = createBlogDto;

      const author = await this._userRepository.findOne({
        where: { id: userId },
      });
      const existingBlog = await this._blogRepository.findOne({
        where: { title: createBlogDto.title },
      });

      if (!author) {
        throw new NotFoundException(`author+ not found`);
      }

      if (existingBlog) {
        throw new ConflictException('Blog with this title already exists');
      }

      const createdBlog = this._blogRepository.create({
        ...blogData,
        author,
      });

      return await this._blogRepository.save(createdBlog);
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(
    query: PaginationOptions,
  ): Promise<PaginationInterface<Blog> | Blog[]> {
    try {
      const {
        relations = ['author'],
        sortBy = 'title',
        sortOrder = 'ASC',
      } = query;

      const queryBuilder = this._blogRepository.createQueryBuilder('blog');

      const validRelations = getMetadataArgsStorage()
        .relations.filter((relation) => relation.target === Blog)
        .map((relation) => relation.propertyName);

      relations.forEach((relation: string) => {
        if (!validRelations.includes(relation)) {
          throw new HttpException(
            `Invalid relation: ${relation}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        queryBuilder.leftJoinAndSelect(`blog.${relation}`, relation);
      });

      return applyFiltersAndPagination(
        queryBuilder,
        { ...query, sortBy, sortOrder },
        validRelations,
        'blog',
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async findOne(id: string, query: any): Promise<Blog> {
    const { relations = ['author'] } = query; // Extract relations from the query

    if (!Array.isArray(relations)) {
      throw new HttpException(
        'Invalid input: relations must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validRelations = getMetadataArgsStorage()
      .relations.filter((relation) => relation.target === Blog)
      .map((relation) => relation.propertyName);

    relations.forEach((relation: string) => {
      if (!validRelations.includes(relation)) {
        throw new HttpException(
          `Invalid relation: ${relation}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    try {
      const blog = await this._blogRepository.findOne({
        where: { id },
        relations,
      });

      if (!blog) {
        throw new NotFoundException(`Blog not found`);
      }

      return blog;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    try {
      const blog = await this._blogRepository.findOne({
        where: { id },
      });
      const user = await this._userRepository.findOne({
        where: { id: updateBlogDto.userId },
      });

      if (!blog) {
        throw new NotFoundException(`Blog not found`);
      }
      if (!user) {
        throw new NotFoundException(`Author not found`);
      }

      blog.author = user;

      this._blogRepository.merge(blog, updateBlogDto);

      await this._blogRepository.save(blog);
      return blog;
    } catch (error) {
      throw new Error(`Failed to update Blog: ${error.message}`);
    }
  }

  async updateBlogFile(id: string, file: Express.Multer.File): Promise<any> {
    try {
      const blog = await this._blogRepository.findOne({
        where: { id },
      });

      if (!blog) {
        throw new NotFoundException(`Blog not found`);
      }
      const oldPath = blog.image;
      const newPath = file.path;
      const fileContent = readFileSync(file.path);
      writeFileSync(newPath, fileContent);

      blog.image = newPath;
      unlinkSync(oldPath);
      return await this._blogRepository.save(blog);
    } catch (error) {
      throw new Error(`Failed to update an image: ${error.message}`);
    }
  }
  async remove(id: string): Promise<any> {
    try {
      const blog = await this._blogRepository.findOne({
        where: { id },
      });

      if (!blog) {
        throw new NotFoundException('Blog not found');
      }

      if (blog.image) {
        try {
          unlinkSync(blog.image);
        } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }

      // Remove the category entity from the database
      await this._blogRepository.remove(blog);

      return {
        message: `Successfully deleted the Blog: ${blog.title}`,
        status: 'success',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Failed to delete the Blog',
          error: error.message || 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
