import { ConflictException } from '@nestjs/common';

export function handleDuplicateError(error: any, entityName: string) {
  if (error.code === 'ER_DUP_ENTRY') {
    // Extract the duplicate value from the error message
    const duplicateValue = error.sqlMessage.match(/'([^']+)'/)[1];
    throw new ConflictException(
      `Duplicate entry: '${duplicateValue}' already exists in ${entityName}.`,
    );
  }
  throw new Error(`Failed to perform operation: ${error.message}`);
}
