import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva-react-router-3';
import { Link } from 'dva-react-router-3/router';
import { Spin, Layout, Row, Col, Tag, Affix, Icon } from 'antd';
import groupBy from 'lodash.groupby';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import ScaffoldItem from '../components/ScaffoldItem';
import styles from './IndexPage.less';

const { Sider, Content } = Layout;

const filterTag = (list, tags, search) => list.filter((item) => {
  if (!tags && !search) {
    return true;
  }
  if (search &&
      (item.name || '').indexOf(search) < 0 &&
      (item.description || '') && item.description.indexOf(search) < 0) {
    return false;
  }
  const queryTags = typeof tags === 'string' ? [tags] : [...(tags || [])];
  return queryTags.every(tag => (item.tags || []).indexOf(tag) >= 0);
});

class IndexPage extends PureComponent {
  static propTypes = {
    list: PropTypes.array,
  };
  static defaultProps = {
    list: [],
  };
  componentDidMount() {
    const { list, dispatch } = this.props;
    if (list.length === 0) {
      dispatch({
        type: 'scaffold/fetch',
      });
    }
  }
  handleClickSort(way) {
    const { dispatch } = this.props;
    dispatch({
      type: 'scaffold/changeSortWay',
      payload: way,
    });
  }
  render() {
    const { list, groupedTags, location: { query }, intl, sortWay } = this.props;
    const tags = Object.keys(groupedTags).sort((a, b) => {
      const value = groupedTags[b].length - groupedTags[a].length;
      if (value !== 0) {
        return value;
      }
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    const filteredItem = filterTag(list, query.tags, query.search);
    const scaffoldItems = (list && list.length > 0) ? (
      <Layout className={styles.normal}>
        <Sider className={styles.sider} width={320}>
          <Affix offsetTop={80}>
            <section className={styles.tags}>
              <h3>
                <FormattedMessage id="home.alltags" />
                {query.tags ? <Link to="/"><FormattedMessage id="home.cleartags" /></Link> : null}
              </h3>
              <section className={styles.tagsSection}>
                {
                  (tags && tags.length > 0)
                    ? tags.map((tag) => {
                      const queryTags = typeof query.tags === 'string'
                        ? [query.tags]
                        : [...(query.tags || [])];
                      const newTags = [...queryTags];
                      if (newTags.indexOf(tag) >= 0) {
                        newTags.splice(newTags.indexOf(tag), 1);
                      } else {
                        newTags.push(tag);
                      }
                      return (
                        <Link
                          to={{
                            pathname: '/',
                            query: { tags: newTags },
                          }}
                          key={tag}
                        >
                          <Tag
                            className={queryTags.indexOf(tag) >= 0 ? `${styles.tag} selected` : styles.tag}
                          >
                            {tag}
                            <span className={styles.tagCount}>
                              | {groupedTags[tag].length}
                            </span>
                          </Tag>
                        </Link>
                      );
                    }) : <div className={styles.notfound}><FormattedMessage id="notags" /></div>
                }
              </section>
            </section>
          </Affix>
        </Sider>
        <Content className={styles.content}>
          <div className={styles.toolbar}>
            <div className={styles.left}>
              <FormattedMessage id="home.count" values={{ count: filteredItem.length }} />
            </div>
            <div className={styles.right}>
              <Icon type="swap" />
              <span
                className={classNames(styles.type, sortWay === 'starCount' ? styles.current : '')}
                onClick={() => this.handleClickSort('starCount')}
              >
                <FormattedMessage id="toolbar.sortByStarCount" />
              </span>
              <span
                className={classNames(styles.type, sortWay === 'updatedAt' ? styles.current : '')}
                onClick={() => this.handleClickSort('updatedAt')}
              >
                <FormattedMessage id="toolbar.sortByUpdatedAt" />
              </span>
            </div>
          </div>
          <Row className={styles.list} gutter={32}>
            {
              filteredItem.length > 0 ?
                filteredItem.map(item => (
                  <Col key={item.name} span={8}>
                    <ScaffoldItem {...item} />
                  </Col>
                )) : <div className={styles.notfound}><FormattedMessage id="notfound" /></div>
            }
          </Row>
        </Content>
      </Layout>
    ) : (
      <div className={styles.loading}>
        <Spin size="large" />
        <div className={styles.tip}>
          <FormattedMessage id="home.loading" />
        </div>
      </div>
    );
    return (
      <div>
        <Helmet>
          <title>
            {intl.formatMessage({ id: 'title.home' })}
          </title>
        </Helmet>
        {scaffoldItems}
      </div>
    );
  }
}

export default injectIntl(connect(({ scaffold: { list = [], sortWay } }) => {
  let tags = [];
  list.forEach((item) => {
    if (item && item.tags) {
      tags = tags.concat(item.tags);
    }
  });
  return {
    list: list.sort((a, b) => {
      if (sortWay === 'updatedAt') {
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      }
      return b.stargazers_count - a.stargazers_count;
    }),
    groupedTags: groupBy(tags),
    sortWay,
  };
})(IndexPage));
