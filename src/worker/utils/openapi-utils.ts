import { resolver } from "hono-openapi";
import type { ZodType, ZodObject } from "zod";

type ResponseConfig = {
  description: string;
  schema: ZodType;
};

type ResponseBuilderResult = {
  description: string;
  content: {
    "application/json": {
      schema: ReturnType<typeof resolver>;
    };
  };
};

type Responses = {
  [statusCode: number]: ResponseBuilderResult;
};

class OpenAPIResponseBuilder {
  private responses: Responses = {};

  ok(config: ResponseConfig): this {
    this.responses[200] = {
      description: config.description,
      content: {
        "application/json": {
          schema: resolver(config.schema),
        },
      },
    };
    return this;
  }

  created(config: ResponseConfig): this {
    this.responses[201] = {
      description: config.description,
      content: {
        "application/json": {
          schema: resolver(config.schema),
        },
      },
    };
    return this;
  }

  badRequest(config: ResponseConfig): this {
    this.responses[400] = {
      description: config.description,
      content: {
        "application/json": {
          schema: resolver(config.schema),
        },
      },
    };
    return this;
  }

  unauthorized(config: ResponseConfig): this {
    this.responses[401] = {
      description: config.description,
      content: {
        "application/json": {
          schema: resolver(config.schema),
        },
      },
    };
    return this;
  }

  forbidden(config: ResponseConfig): this {
    this.responses[403] = {
      description: config.description,
      content: {
        "application/json": {
          schema: resolver(config.schema),
        },
      },
    };
    return this;
  }

  notFound(config: ResponseConfig): this {
    this.responses[404] = {
      description: config.description,
      content: {
        "application/json": {
          schema: resolver(config.schema),
        },
      },
    };
    return this;
  }

  unprocessableEntity(config: ResponseConfig): this {
    this.responses[422] = {
      description: config.description,
      content: {
        "application/json": {
          schema: resolver(config.schema),
        },
      },
    };
    return this;
  }

  internalServerError(config: ResponseConfig): this {
    this.responses[500] = {
      description: config.description,
      content: {
        "application/json": {
          schema: resolver(config.schema),
        },
      },
    };
    return this;
  }

  custom(statusCode: number, config: ResponseConfig): this {
    this.responses[statusCode] = {
      description: config.description,
      content: {
        "application/json": {
          schema: resolver(config.schema),
        },
      },
    };
    return this;
  }

  build(): Responses {
    return this.responses;
  }
}

export const openapiBuilder = new OpenAPIResponseBuilder();

export const createResponseBuilder = () => new OpenAPIResponseBuilder();

/**
 * Converts a Zod object schema to OpenAPI parameter definitions for query parameters
 * @param schema - Zod object schema containing query parameter definitions
 * @returns Array of OpenAPI parameter objects
 */
export const zodSchemaToParameters = (schema: ZodObject<any>) => {
  const shape = schema._def.shape;
  const parameters: Array<{
    name: string;
    in: "query";
    required: boolean;
    description?: string;
    schema: any;
  }> = [];

  for (const [key, value] of Object.entries(shape)) {
    const zodField = value as any;
    const isOptional =
      zodField._def.typeName === "ZodOptional" || zodField.type === "optional";
    const innerType = isOptional ? zodField._def.innerType : zodField;

    // Extract description from the schema
    const description = innerType._def.description;

    // Determine the OpenAPI type
    let openApiType = "string";
    // oxlint-disable-next-line no-unassigned-vars
    let format: string | undefined;

    if (innerType._def.typeName === "ZodString") {
      openApiType = "string";
    } else if (innerType._def.typeName === "ZodNumber") {
      openApiType = "number";
    } else if (innerType._def.typeName === "ZodBoolean") {
      openApiType = "boolean";
    } else if (innerType._def.typeName === "ZodEnum") {
      openApiType = "string";
    }

    parameters.push({
      name: key,
      in: "query",
      required: !isOptional,
      ...(description && { description }),
      schema: {
        type: openApiType,
        ...(format && { format }),
        ...(innerType._def.typeName === "ZodEnum" && {
          enum: innerType._def.values,
        }),
      },
    });
  }

  return parameters;
};
