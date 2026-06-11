import type { Schema, Struct } from '@strapi/strapi';

export interface BlogBlogContent extends Struct.ComponentSchema {
  collectionName: 'components_blog_blog_contents';
  info: {
    displayName: 'BlogContent';
  };
  attributes: {
    BlogContent: Schema.Attribute.RichText;
  };
}

export interface BlogFaq extends Struct.ComponentSchema {
  collectionName: 'components_blog_faqs';
  info: {
    displayName: 'FAQ';
  };
  attributes: {
    question_answer: Schema.Attribute.Component<'blog.question-answer', true>;
  };
}

export interface BlogQuestionAnswer extends Struct.ComponentSchema {
  collectionName: 'components_blog_question_answers';
  info: {
    displayName: 'Question Answer';
  };
  attributes: {
    answer: Schema.Attribute.RichText;
    question: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blog.blog-content': BlogBlogContent;
      'blog.faq': BlogFaq;
      'blog.question-answer': BlogQuestionAnswer;
    }
  }
}
